import { getTensorMarketplaceProgram } from './generated';

export const tensorMarketplace = () => ({
  install() {
    getTensorMarketplaceProgram();
  },
});
