// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title LedgerAnchor
/// @notice Polygon(PoS) 분산 원장: 계정 정보 Identity Hash 앵커링 — 누구도 수정할 수 없는 불변 기록
contract LedgerAnchor {
    /// @notice mapping_hash => 앵커링 시각 (0이면 미기록)
    mapping(bytes32 => uint256) public anchoredAt;

    event IdentityAnchored(bytes32 indexed mappingHash, uint256 timestamp);

    /// @notice 계정 정보 해시(SHA-256)를 체인에 기록. 동일 해시는 1회만 기록.
    /// @param _mappingHash user_id:wallet_address 의 SHA-256 해시 (bytes32)
    function anchorIdentity(bytes32 _mappingHash) external {
        require(anchoredAt[_mappingHash] == 0, "Already anchored");
        anchoredAt[_mappingHash] = block.timestamp;
        emit IdentityAnchored(_mappingHash, block.timestamp);
    }
}
