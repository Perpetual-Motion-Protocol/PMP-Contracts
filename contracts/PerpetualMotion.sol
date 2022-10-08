// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

import "./interfaces/IPerpetualMotion.sol";

/// @title Perpetual Motion Protocol
/// @author chris, danceratopz
/// @notice A protocol that enables contributors to stream donations to
///         project creators

contract PerpetualMotionProtocol is IPerpetualMotion {
    uint256 public projectCount;

    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(address => uint256)) contributorAmounts;
    mapping(uint256 => mapping(address => Strategies)) strategy;

    function createProject(
        string memory name,
        string memory description,
        address fundingAddress,
        uint256 fundingGoal,
        uint256 duration
    ) public {
        projects[projectCount] = Project({
            name: name,
            description: description,
            fundingAddress: fundingAddress,
            fundingGoal: fundingGoal,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            contributorAddresses: new address[](0)
        });
        projectCount += 1;
        emit ProjectCreated(fundingAddress, name, description, fundingGoal);
    }
}
