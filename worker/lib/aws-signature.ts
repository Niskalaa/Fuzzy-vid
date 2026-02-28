import { AwsClient } from '@aws-sdk/protocol-http';
import { Sha256 } from '@aws-crypto/sha256-js';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { HttpRequest } from '@aws-sdk/protocol-http';

// This is a basic implementation. In a real-world scenario, you would want to handle errors and edge cases more gracefully.

const signer = new SignatureV4({
    credentials: defaultProvider(),
    region: 'us-east-1', // this will be overridden by the request
    service: 'bedrock',
    sha256: Sha256,
});

export async function signRequest(request: HttpRequest, region: string) {
    const signedRequest = await signer.sign(request, { region });
    return signedRequest;
}
