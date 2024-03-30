import { userSocketIds } from "../server.js";

export const getSocketIds = (members = []) => {
  const socketIds = members.map((member) =>
    userSocketIds.get(member.toString())
  );
  return socketIds;
};
