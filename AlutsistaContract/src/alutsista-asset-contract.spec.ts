/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { AlutsistaAssetContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logger = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('AlutsistaAssetContract', () => {

    let contract: AlutsistaAssetContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new AlutsistaAssetContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"alutsista asset 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"alutsista asset 1002 value"}'));
    });

    describe('#alutsistaAssetExists', () => {

        it('should return true for a alutsista asset', async () => {
            await contract.alutsistaAssetExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a alutsista asset that does not exist', async () => {
            await contract.alutsistaAssetExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createAlutsistaAsset', () => {

        it('should create a alutsista asset', async () => {
            await contract.createAlutsistaAsset(ctx, '1003', 'alutsista asset 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"alutsista asset 1003 value"}'));
        });

        it('should throw an error for a alutsista asset that already exists', async () => {
            await contract.createAlutsistaAsset(ctx, '1001', 'myvalue').should.be.rejectedWith(/The alutsista asset 1001 already exists/);
        });

    });

    describe('#readAlutsistaAsset', () => {

        it('should return a alutsista asset', async () => {
            await contract.readAlutsistaAsset(ctx, '1001').should.eventually.deep.equal({ value: 'alutsista asset 1001 value' });
        });

        it('should throw an error for a alutsista asset that does not exist', async () => {
            await contract.readAlutsistaAsset(ctx, '1003').should.be.rejectedWith(/The alutsista asset 1003 does not exist/);
        });

    });

    describe('#updateAlutsistaAsset', () => {

        it('should update a alutsista asset', async () => {
            await contract.updateAlutsistaAsset(ctx, '1001', 'alutsista asset 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"alutsista asset 1001 new value"}'));
        });

        it('should throw an error for a alutsista asset that does not exist', async () => {
            await contract.updateAlutsistaAsset(ctx, '1003', 'alutsista asset 1003 new value').should.be.rejectedWith(/The alutsista asset 1003 does not exist/);
        });

    });

    describe('#deleteAlutsistaAsset', () => {

        it('should delete a alutsista asset', async () => {
            await contract.deleteAlutsistaAsset(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a alutsista asset that does not exist', async () => {
            await contract.deleteAlutsistaAsset(ctx, '1003').should.be.rejectedWith(/The alutsista asset 1003 does not exist/);
        });

    });

});
