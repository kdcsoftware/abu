const makeRead = ({ model }) => {
  const read = async ({ modelId, id }) => {
    const res = await model.get({ modelId, id });
    if (res?.Item) return res.Item;
    throw new Error("Content not found");
  };
  return read;
};
export default makeRead;
