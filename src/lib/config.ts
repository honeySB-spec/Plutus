
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    baseSepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'Yield Watch',
    projectId: 'YOUR_PROJECT_ID',
    chains: [mainnet, polygon, optimism, arbitrum, base, baseSepolia],
    ssr: true, // If your dApp uses server side rendering (SSR)
});
