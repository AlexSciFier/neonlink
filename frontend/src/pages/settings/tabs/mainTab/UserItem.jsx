import React, { useState } from "react";
import { PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ConfirmationButtons } from "../groupTab/ConfirmationButtons";

export default function UserItem({ user, deleteUser, editUser }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(user?.isAdmin);

  async function handleDelete() {
    await deleteUser(user.id);
  }

  async function handleEdit() {
    await editUser(user.id, password, isAdmin);
  }

  async function handleConfirm() {
    if (isDeleting) {
      handleDelete();
    } else {
      handleEdit();
    }
    setIsEdit(false);
    setIsDeleting(false);
  }

  return (
    <li className="flex items-center gap-1 dark:hover:bg-white/10 hover:bg-black/10 px-2 rounded">
      {isEdit ? (
        <div className="flex gap-1">
          <span>{user.username}</span>
          <input
            type="password"
            name="password"
            className="flex-1 bg-transparent ring ring-cyan-600 rounded mr-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
          ></input>
          <label className="flex gap-1">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            ></input>
            <div>Admin</div>
          </label>
        </div>
      ) : (
        <div className={`${isDeleting && "line-through opacity-70"}`}>
          <span>{user.username}</span>{" "}
          {user.isAdmin && (
            <span className="bg-red-600 text-white uppercase text-sm px-2 rounded-full">
              Admin
            </span>
          )}
        </div>
      )}
      <div className="flex-1"></div>
      <div className="flex items-center gap-1">
        {isDeleting || isEdit ? (
          <ConfirmationButtons
            onConfirm={handleConfirm}
            onCancel={() => {
              setIsDeleting(false);
              setIsEdit(false);
            }}
          />
        ) : (
          <>
            <button
              onClick={() => setIsEdit(!isEdit)}
              className="w-5 h-5 hover:text-cyan-500"
            >
              <PencilIcon />
            </button>
            <button
              onClick={() => setIsDeleting(true)}
              className="w-5 h-5 hover:text-red-500"
            >
              <XMarkIcon />
            </button>
          </>
        )}
      </div>
    </li>
  );
}
