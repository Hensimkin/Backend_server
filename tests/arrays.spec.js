import {expect} from 'chai'

describe("arrays",()=>{
    describe("#sort",()=>{
        it("sorting names array",()=>{
            var names=["adam","hen"];
            expect(names.sort()).to.be.eql(["hen","adam"]);
        });
    });
});