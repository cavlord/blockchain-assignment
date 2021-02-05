/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class AlutsistaAsset {

    @Property()
    public value: string;
    year: any;
    name: string;
    countryOrigin: string;

}
