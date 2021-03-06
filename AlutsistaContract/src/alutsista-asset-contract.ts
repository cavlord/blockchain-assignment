/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { AlutsistaAsset } from './alutsista-asset';

@Info({title: 'AlutsistaAssetContract', description: 'My Smart Contract' })
export class AlutsistaAssetContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async alutsistaAssetExists(ctx: Context, alutsistaAssetId: string): Promise<boolean> {
        const data: Uint8Array = await ctx.stub.getState(alutsistaAssetId);
        return (!!data && data.length > 0);
    }

    @Transaction()
    public async createAlutsistaAsset(ctx: Context, alutsistaAssetId: string, name: string, countryOrigin: string, type: string): Promise<void> {
        const hasAccess = await this.hasRole(ctx, ['Manufacturer']);
        if (!hasAccess) {
            throw new Error(`Only manufacturer can create alutsista asset`);
        }        
        const exists: boolean = await this.alutsistaAssetExists(ctx, alutsistaAssetId);
        if (exists) {
            throw new Error(`The alutsista asset ${alutsistaAssetId} already exists`);
        }
        const alutsistaAsset: AlutsistaAsset = new AlutsistaAsset();
        alutsistaAsset.name = name;
        alutsistaAsset.countryOrigin = countryOrigin;
        alutsistaAsset.type = type;
        const buffer: Buffer = Buffer.from(JSON.stringify(alutsistaAsset));
        await ctx.stub.putState(alutsistaAssetId, buffer);
       
        const transientMap = ctx.stub.getTransient();
        if(transientMap.get('remark')){
            await ctx.stub.putPrivateData('productionRemark',alutsistaAssetId,transientMap.get('remark'));
        }
    }

    @Transaction(false)
    @Returns('AlutsistaAsset')
    public async readAlutsistaAsset(ctx: Context, alutsistaAssetId: string): Promise<AlutsistaAsset> {
        const exist = await this.alutsistaAssetExists(ctx,alutsistaAssetId);
        if(!exist){
            throw new Error(`The Alutsista Assets ${alutsistaAssetId} does not exist`)
        }
        const buffer = await ctx.stub.getState(alutsistaAssetId);
        const AlutsistaAsset = JSON.parse(buffer.toString()) as AlutsistaAsset;

        try{
            const privBuffer = await ctx.stub.getPrivateData('productionRemark', alutsistaAssetId);
            AlutsistaAsset.remark = privBuffer.toString();
            return AlutsistaAsset;
        }
        catch(error){
            return AlutsistaAsset;
        }
    }

    @Transaction()
    public async updateAlutsistaAsset(ctx: Context, alutsistaAssetId: string, newValue: string): Promise<void> {
        const exists: boolean = await this.alutsistaAssetExists(ctx, alutsistaAssetId);
        if (!exists) {
            throw new Error(`The alutsista asset ${alutsistaAssetId} does not exist`);
        }
        const alutsistaAsset: AlutsistaAsset = new AlutsistaAsset();
        alutsistaAsset.value = newValue;
        const buffer: Buffer = Buffer.from(JSON.stringify(alutsistaAsset));
        await ctx.stub.putState(alutsistaAssetId, buffer);
    }

    @Transaction()
    public async deleteAlutsistaAsset(ctx: Context, alutsistaAssetId: string): Promise<void> {
        const hasAccess = await this.hasRole(ctx, ['Dealer']);
        if (!hasAccess) {
            throw new Error(`Only dealer can delete car asset`);
        }
        const exists: boolean = await this.alutsistaAssetExists(ctx, alutsistaAssetId);
        if (!exists) {
            throw new Error(`The alutsista asset ${alutsistaAssetId} does not exist`);
        }
        await ctx.stub.deleteState(alutsistaAssetId);
    }
    @Transaction(false)
    public async queryAllAssets(ctx: Context): Promise<string> {
        const startKey = '000';
        const endKey = '999';
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString());

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString());
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString();
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }
    public async hasRole(ctx: Context, roles: string[]) {
        const clientID = ctx.clientIdentity;
        for (const roleName of roles) {
            if (clientID.assertAttributeValue('role', roleName)) {
                if (clientID.getMSPID() === 'Org1MSP' && clientID.getAttributeValue('role') === 'Manufacturer') { return true; }
                if (clientID.getMSPID() === 'Org2MSP' && clientID.getAttributeValue('role') === 'Dealer') { return true; }
            }
        }
        return false;
    }

}
