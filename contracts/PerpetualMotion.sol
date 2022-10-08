// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

/// @title Perpetual Motion Protocol
/// @author chris, danceratopz
/// @notice A protocol that enables contributors to stream donations to
///         project creators

contract PerpetualMotionProtocol {
    
    constructor() {}

    uint256 public projectCount;

    struct Project {
        string name;
        string description;
        address fundingAddress;
        uint256 fundingGoal;
        uint256 startTime;
        uint256 endTime;
        address[] contributorAddresses;
    }

    mapping(uint256 => Project) public projects;

    mapping(uint256 => mapping(address => uint256)) contributorAmounts;
    mapping(uint256 => mapping(address => Strategies)) strategy;


    enum Strategies {
        PeriodicLumpSum,
        Stream,
        Roundup
    }

    struct LumpSumStrategy {
        uint256 amount;
        uint256 timePeriod;
    }

    struct StreamStrategy {
        uint256 amount;
        uint256 timePeriod;
    }

    struct RoundUp {
        address erc20Address;
    }

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
    }
}