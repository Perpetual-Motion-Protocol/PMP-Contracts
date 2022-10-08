//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IPerpetualMotion {
    struct Project {
        string name;
        string description;
        address fundingAddress;
        uint256 fundingGoal;
        uint256 startTime;
        uint256 endTime;
        address[] contributorAddresses;
    }

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

    event ProjectCreated(
        address indexed fundingAddress,
        string name,
        string description,
        uint256 fundingGoal
    );
}
