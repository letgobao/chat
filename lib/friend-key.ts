import md5 from "md5";

export const generateFriendKey = (...ids: string[]) =>
  md5(ids.sort().join(""));
