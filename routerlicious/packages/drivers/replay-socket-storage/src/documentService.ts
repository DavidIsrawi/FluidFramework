import * as api from "@prague/container-definitions";
import { TokenProvider } from "@prague/routerlicious-socket-storage";
import { DeltaStorageService, ReplayDeltaStorageService } from "./deltaStorageService";
import { ReplayDocumentDeltaConnection } from "./documentDeltaConnection";
import { ReplayDocumentStorageService } from "./replayDocumentStorageService";

/**
 * The Replay document service dummies out the snapshot and the delta storage.
 * Delta connection simulates the socket by fetching the ops from delta storage
 * and emitting them with a pre determined delay
 */
export class ReplayDocumentService implements api.IDocumentService {
    private deltaStorage: DeltaStorageService;
    constructor(private deltaUrl: string,
                private replayFrom: number,
                private replayTo: number,
                private unitIsTime: boolean,
                private tenantId: string,
                private documentId: string) {
        this.deltaStorage = new DeltaStorageService(this.deltaUrl);
    }

    public async createTokenProvider(tokens: { [name: string]: string }): Promise<api.ITokenProvider> {
        return new TokenProvider(tokens.jwt);
    }

    public async connectToStorage(tokenProvider: api.ITokenProvider): Promise<api.IDocumentStorageService> {
        return new ReplayDocumentStorageService();
    }

    public async connectToDeltaStorage(tokenProvider: api.ITokenProvider): Promise<api.IDocumentDeltaStorageService> {
        return new ReplayDeltaStorageService();
    }

    public async connectToDeltaStream(
        tokenProvider: api.ITokenProvider,
        client: api.IClient): Promise<api.IDocumentDeltaConnection> {
        return ReplayDocumentDeltaConnection.Create(this.tenantId, this.documentId, tokenProvider, this.deltaStorage,
             this.replayFrom, this.replayTo, this.unitIsTime);
    }

    public async branch(tokenProvider: api.ITokenProvider): Promise<string> {
        return null;
    }

    public getErrorTrackingService() {
        return null;
    }
}
