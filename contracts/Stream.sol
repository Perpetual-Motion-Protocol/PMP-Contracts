// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {IConstantFlowAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {CFAv1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";

contract Stream {
    using CFAv1Library for CFAv1Library.InitData;

    //initialize cfaV1 variable
    CFAv1Library.InitData public cfaV1;

    function initalize(ISuperfluid host) public{
        //initialize InitData struct, and set equal to cfaV1
        cfaV1 = CFAv1Library.InitData(
            host,
            IConstantFlowAgreementV1(
                address(
                    host.getAgreementClass(
                        keccak256(
                            "org.superfluid-finance.agreements.ConstantFlowAgreement.v1"
                        )
                    )
                )
            )
        );
    }

    function _createFlow(
        ISuperfluidToken token,
        address receiver,
        int96 flowRate
    ) internal {
        cfaV1.createFlow(receiver, token, flowRate);
    }

    function _updateFlow(
        ISuperfluidToken token,
        address receiver,
        int96 flowRate
    ) internal {
        cfaV1.updateFlow(receiver, token, flowRate);
    }

    function _deleteFlow(ISuperfluidToken token, address receiver) internal {
        cfaV1.deleteFlow(address(this), receiver, token);
    }
}
