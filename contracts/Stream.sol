// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {IConstantFlowAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {CFAv1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";

contract Stream {
    using CFAv1Library for CFAv1Library.InitData;

    //initialize cfaV1 variable
    CFAv1Library.InitData public cfaV1;

    function init(ISuperfluid host) public {
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

    function _createFlowByOperator(
        address sender,
        address receiver,
        ISuperfluidToken token,
        int96 flowRate
    ) internal {
        cfaV1.createFlowByOperator(sender, receiver, token, flowRate);
    }

    function _deleteFlowByOperator(
        address sender,
        address receiver,
        ISuperfluidToken token
    ) internal {
        cfaV1.deleteFlowByOperator(sender, receiver, token);
    }
}
