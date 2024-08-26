import { userSocketIds } from "../sockets/socket.js";

export const getSocketIds = (members = []) => {
  const socketIds = members.map((member) =>
    userSocketIds.get(member.toString())
  );
  return socketIds;
};

export const emitEvent = (req, event, members, data) => {
  const io = req.app.get("io");
  const membersSocketId = getSocketIds(members);
  io.to(membersSocketId).emit(event, data);
};
