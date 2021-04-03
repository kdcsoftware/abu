const makeList = ({ model }) => {
  const list = async ({ modelId }) => {
    const res = await model.query(`MOD#${modelId}#CON`, { index: "GSI" });
    return res;
  };
  return list;
};
export default makeList;