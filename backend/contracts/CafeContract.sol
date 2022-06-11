// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

import "./ICafeRegistry.sol";

contract CafeContract is ERC1155, AccessControl, Pausable, ERC1155Burnable {
    uint256 public constant CAFE_TOKEN = 0;
    uint256 public constant CLAIMED = 1;
    uint256 public constant MEMBERSHIP_LEVEL = 2;

    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // uint256[] public immutable membershipLevels;

    // uint256 public freeCoffeeAmount;

    error CafeContract__CannotClaim();

    constructor(address _adminRole, address _cafeOwner)
        // uint256[] calldata _membershipLevels,
        // uint256 _freeCoffeeAmount
        ERC1155("")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, _adminRole); // TODO: CafeCore and us (backup)?
        _grantRole(URI_SETTER_ROLE, _cafeOwner); // TODO: cafe a cafe owner?
        _grantRole(PAUSER_ROLE, _cafeOwner); // TODO: only cafe a cafe owner?
        _grantRole(MINTER_ROLE, msg.sender); // TODO: CafeCore and a cafe owner?
        // membershipLevels = _membershipLevels;
        // freeCoffeeAmount = _freeCoffeeAmount;
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
        // check membership
        uint256[] memory _membershipThresholds;
        _membershipThresholds = ICafeRegistry(address(this))
            .getMembershipDiscountsThresholds(address(this));

        uint256 currentLevel = balanceOf(account, MEMBERSHIP_LEVEL);
        uint256 currentThreshold = _membershipThresholds[currentLevel];

        if (currentThreshold < _membershipThresholds.length) {
            uint256 nextThreshold = _membershipThresholds[currentLevel + 1];
            if (balanceOf(account, CAFE_TOKEN) >= nextThreshold) {
                _mint(account, MEMBERSHIP_LEVEL, 1, "");
            }
        }
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
