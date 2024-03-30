import { getSocketIds } from "../lib/helper.js";

const emitEvent = (req, event, members, data) => {
  const io = req.app.get("io");
  const membersSocketId = getSocketIds(members);
  io.to(membersSocketId).emit(event, data);
};

export { emitEvent };
