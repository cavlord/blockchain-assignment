/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class AlutsistaAsset {

    @Property()
    public value: string;
    name: string;
    countryOrigin: string;
    type: string;
    remark: string;

}
