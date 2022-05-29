import { EthereumService } from 'services/EthereumService';
import { IEthereumService } from './EthereumService';
import { IContainer, IRegistry, Registration } from "aurelia";

export const register = {
    register: (container: IContainer) => {
        container.register(Registration.singleton(IEthereumService, EthereumService));
        return container;
    }
} as IRegistry;