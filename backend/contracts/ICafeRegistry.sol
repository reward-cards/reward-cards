// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

interface ICafeRegistry {
    function getCafeContract(address _cafeContract)
        external
        view
        returns (address);

    function getPriceOfItem(address _cafeContract, string memory _item)
        external
        view
        returns (uint256);

    function getRewardForItem(address _cafeContract, string calldata _item)
        external
        view
        returns (uint256);

    function getMembershipDiscountsThresholds(address _cafeContract)
        external
        view
        returns (uint256[] memory);

    function getMembershipDiscount(
        address _cafeContract,
        uint8 _membershipLevel
    ) external view returns (uint256);
}
