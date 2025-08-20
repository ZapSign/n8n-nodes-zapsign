import type { INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export interface NodeDescriptionBuilder {
    build(): Pick<INodeTypeDescription, 'displayName' | 'name' | 'icon' | 'group' | 'version' | 'subtitle' | 'description' | 'defaults' | 'inputs' | 'outputs' | 'credentials'>;
}

export class ZapSignDescriptionBuilder implements NodeDescriptionBuilder {
    build(): Pick<INodeTypeDescription, 'displayName' | 'name' | 'icon' | 'group' | 'version' | 'subtitle' | 'description' | 'defaults' | 'inputs' | 'outputs' | 'credentials'> {
        return {
            displayName: 'ZapSign',
            name: 'zapSign',
            icon: 'file:zapsign.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            description: 'Interact with ZapSign API for digital signatures',
            defaults: {
                name: 'ZapSign',
            },
            inputs: [NodeConnectionType.Main],
            outputs: [NodeConnectionType.Main],
            credentials: [
                {
                    name: 'zapSignApi',
                    required: true,
                },
            ],
        };
    }
}

