// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Todos {
    struct Todo {
        uint256 id;
        string text;
        bool completed;
        address owner;
    }
    Todo[] public todos;
    uint256 public nextId = 0;
    
    function create(string memory _text) public {
        todos.push(Todo({
            id: nextId,
            text: _text,
            completed: false,
            owner: msg.sender
        }));

        nextId++;
    }
    
    function toggleCompleted(uint256 _id) public {
        if (todos[_id].owner != msg.sender) {
            revert("Not the owner of this todo");
        }
        todos[_id].completed = !todos[_id].completed;
    }

    function getTodo(uint256 _id) public view returns (Todo memory) {
        if (todos[_id].owner == address(0)) {
            revert("Todo does not exist");
        }
        return todos[_id];
    }
}
