// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./ICafeRegistry.sol";

contract CafeContract is ERC1155, AccessControl, Pausable {
    uint256 public constant CAFE_TOKEN = 0;
    uint256 public constant CLAIMED = 1;
    uint256 public constant MEMBERSHIP_LEVEL = 2;

    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    address private immutable cafeRegistry;

    // uint256[] public immutable membershipLevels;

    // uint256 public freeCoffeeAmount;

    error CafeContract__CannotClaim();

    constructor(
        address _adminRole,
        address _cafeOwner,
        address _cafeCore,
        address _cafeRegistry
    ) ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, _adminRole); // TODO: CafeCore and us (backup)?
        _grantRole(URI_SETTER_ROLE, _cafeOwner); // TODO: cafe a cafe owner?
        _grantRole(PAUSER_ROLE, _cafeOwner); // TODO: only cafe a cafe owner?
        _grantRole(MINTER_ROLE, _cafeCore); // TODO: CafeCore and a cafe owner?
        // membershipLevels = _membershipLevels;
        // freeCoffeeAmount = _freeCoffeeAmount;
        cafeRegistry = _cafeRegistry;
    }

    function setURI(string memory newuri) public onlyRole(URI_SETTER_ROLE) {
        _setURI(newuri);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(address account, uint256 amount)
        public
        onlyRole(MINTER_ROLE)
    {
        _mint(account, CAFE_TOKEN, amount, "");

        uint256 currentLevel = balanceOf(account, MEMBERSHIP_LEVEL);
        uint256 nextThreshold = ICafeRegistry(cafeRegistry)
            .getMembershipDiscountsThresholds(address(this), currentLevel + 1);
        if (nextThreshold > 0) {
            if (balanceOf(account, CAFE_TOKEN) >= nextThreshold) {
                _mint(account, MEMBERSHIP_LEVEL, 1, "");
            }
        }
    }

    function mintClaimed(address account) public onlyRole(MINTER_ROLE) {
        _mint(account, CLAIMED, 1, "");
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyRole(MINTER_ROLE) {
        _mintBatch(to, ids, amounts, data);
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
