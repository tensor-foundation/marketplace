#!/usr/bin/env zx
import {
  getExternalProgramOutputDir,
  getCargo,
  getProgramFolders,
} from "./utils.mjs";
import { Octokit } from "@octokit/rest";
import JSZip from "jszip";
import "zx/globals";

const pat = await getPAT();
const branch = "main";
const status = "success";
const artifactName = "programs-build";
const octokit = new Octokit({ auth: pat });
const externalRepos = getProgramFolders().flatMap(
  (folder) =>
    getCargo(folder).package?.metadata?.solana?.[
      "external-programs-repositories"
    ] ?? [],
);

await Promise.all(
  externalRepos.map(async (repoInfo) => {
    var [repoPath, programAddress] = repoInfo;
    repoPath = repoPath.startsWith("/") ? repoPath.substring(1) : repoPath;
    const [owner, repo] = repoPath.split("/");
    // Get all workflow runs that match owner / repo / branch / status
    const wfrun = await octokit.rest.actions
      .listWorkflowRunsForRepo({
        owner,
        repo,
        branch,
        status,
      })
      .then((resp) => {
        // Sort response by desc. date and return latest run
        return resp.data.workflow_runs.sort(
          (wfr1, wfr2) =>
            new Date(wfr2.run_started_at) - new Date(wfr1.run_started_at),
        )[0];
      });
    // Get info for artifact that matches the wanted artifact name
    const latestArtifact = await octokit.rest.actions
      .listWorkflowRunArtifacts({
        owner,
        repo,
        run_id: wfrun.id,
      })
      .then((resp) => {
        return resp.data.artifacts.find(
          (artifact) => artifact.name == artifactName,
        );
      });
    // Fetch that artifact and load it
    const resp = await octokit.request(
      `GET /repos/${repoPath}/actions/artifacts/${latestArtifact.id}/zip`,
    );
    const zipData = await JSZip().loadAsync(resp.data);
    // Hardcoded location of binaries in zip
    const binary = zipData
      .folder("target")
      .folder("deploy")
      .file(`${repo}_program.so`);
    // Asynchronously read binaries and write into externalProgramOutputDir
    await binary
      .async("nodebuffer")
      .then((data) =>
        fs.writeFileSync(
          path.join(getExternalProgramOutputDir(), `${programAddress}.so`),
          data,
        ),
      );

    console.log(
      `${repo} binary saved successfully to ${path.join(getExternalProgramOutputDir(), `${programAddress}.so`)}!`,
    );
  }),
);

// Helper func that fetches Personal Access Token from ~/.npmrc
function getPAT() {
  try {
    if (process.env.ARTIFACTS_TOKEN) {
      return process.env.ARTIFACTS_TOKEN;
    }
    const npmrcPath = path.join(os.homedir(), ".npmrc");
    const data = fs.readFileSync(npmrcPath, "utf8");
    const lines = data.split("\n");
    const config = {};
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (
        trimmedLine &&
        !trimmedLine.startsWith(";") &&
        !trimmedLine.startsWith("#")
      ) {
        const [key, value] = trimmedLine.split("=");
        if (key && value) {
          config[key.trim()] = value.trim();
        }
      }
    });
    const npmTokenKey = "//npm.pkg.github.com/:_authToken";
    const pat = config[npmTokenKey];
    if (!pat) {
      new Error("Personal Access Token not found in .npmrc file.");
    }
    return pat;
  } catch (err) {
    console.error("Error reading .npmrc file:", err);
  }
}
