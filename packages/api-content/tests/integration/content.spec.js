import {
  start,
  makeFakeEvent,
  genBlog,
  genAbout,
  genHome,
  genSocial,
} from "helper";
import { handler as create } from "../../src/create";
import { handler as list } from "../../src/list";
import { handler as read } from "../../src/read";
import { handler as remove } from "../../src/delete";
import { handler as update } from "../../src/update";

let ddb;
let tableName;
const contents = {
  about_page: [],
  blog: [],
  home: [],
  social_profile: [],
};

describe("Content", () => {
  beforeAll(async () => {
    ({ DocumentClient: ddb, TableName: tableName } = await start());
  });

  [
    { content: genBlog(), modelId: "blog" },
    { content: genBlog(), modelId: "blog" },
    { content: genAbout(), modelId: "about_page" },
    { content: genBlog(), modelId: "blog" },
    { content: genBlog(), modelId: "blog" },
    { content: genSocial(), modelId: "social_profile" },
    { content: genBlog(), modelId: "blog" },
    { content: genHome(), modelId: "home" },
    { content: genSocial(), modelId: "social_profile" },
    { content: genBlog(), modelId: "blog" },
    { content: genBlog(), modelId: "blog" },
    { content: genSocial(), modelId: "social_profile" },
    { content: genBlog(), modelId: "blog" },
    { content: genBlog(), modelId: "blog" },
    { content: genBlog(), modelId: "blog" },
    { content: genSocial(), modelId: "social_profile" },
    { content: genBlog(), modelId: "blog" },
    { content: genBlog(), modelId: "blog" },
    { content: genBlog(), modelId: "blog" },
    { content: genSocial(), modelId: "social_profile" },
    { content: genBlog(), modelId: "blog" },
    { content: genBlog(), modelId: "blog" },
    { content: genBlog(), modelId: "blog" },
  ].forEach(({ content, modelId }) => {
    it(`should create ${modelId}`, async () => {
      const event = makeFakeEvent({
        path: "/",
        pathParameters: { modelId },
        headers: { "Content-Type": "application/json" },
        httpMethod: "POST",
        body: JSON.stringify(content),
      });

      const response = await create(event);
      expect(response.statusCode).toEqual(201);
      expect(response.isBase64Encoded).toBe(false);
      const json = JSON.parse(response.body);
      expect(json).toHaveProperty("id");

      const sk =
        modelId === "home" || modelId === "about_page"
          ? `CON#${modelId}`
          : `CON#${json.id}`;
      const params = {
        TableName: tableName,
        Key: {
          pk: `MOD#${modelId}`,
          sk,
        },
      };

      const { Item } = await ddb.get(params).promise();

      let expected = content;
      if (modelId === "home" || modelId === "about_page") {
        const { id, ...rest } = content;
        expected = rest;
      }
      expect(Item.data).toEqual(expected);

      contents[modelId].push({ ...expected, id: json.id });
    });
  });

  it("should list blogs with pagination", async () => {
    let event = makeFakeEvent({
      path: "/",
      pathParameters: { modelId: "blog" },
      headers: { "Content-Type": "application/json" },
      httpMethod: "GET",
    });

    let response = await list(event);
    expect(response.statusCode).toEqual(200);
    expect(response.isBase64Encoded).toBe(false);
    let json = JSON.parse(response.body);
    expect(json).toHaveProperty("cursor");
    expect(json.Items).toHaveLength(10);

    // second page
    event = makeFakeEvent({
      path: "/",
      pathParameters: { modelId: "blog" },
      queryStringParameters: { cursor: json.cursor },
      headers: { "Content-Type": "application/json" },
      httpMethod: "GET",
    });

    response = await list(event);
    expect(response.statusCode).toEqual(200);
    expect(response.isBase64Encoded).toBe(false);
    json = JSON.parse(response.body);
    expect(json).toHaveProperty("cursor");
    expect(json.Items).toHaveLength(6);
  });

  it("should list all blogs", async () => {
    let event = makeFakeEvent({
      path: "/",
      pathParameters: { modelId: "blog" },
      queryStringParameters: { all: "true" },
      headers: { "Content-Type": "application/json" },
      httpMethod: "GET",
    });

    let response = await list(event);
    expect(response.statusCode).toEqual(200);
    expect(response.isBase64Encoded).toBe(false);
    let json = JSON.parse(response.body);
    expect(json).not.toHaveProperty("cursor");
    expect(json.Items).toHaveLength(16);
  });

  it("should read a blog", async () => {
    const blog = contents.blog[5];
    const event = makeFakeEvent({
      path: "/",
      pathParameters: { modelId: "blog", id: blog.id },
      queryStringParameters: { all: "true" },
      headers: { "Content-Type": "application/json" },
      httpMethod: "GET",
    });

    const response = await read(event);
    expect(response.statusCode).toEqual(200);
    expect(response.isBase64Encoded).toBe(false);

    const json = JSON.parse(response.body);
    expect(json.id).toBe(blog.id);
    expect(json.name).toBe(blog.name);
    expect(json.cover_image).toEqual(blog.cover_image);
    expect(json.excerpt).toBe(blog.excerpt);
    expect(json.body).toBe(blog.body);
    expect(json.slug).toBe(blog.slug);
    expect(json.tags).toBe(blog.tags);
    expect(json).toHaveProperty("created");
    expect(json).toHaveProperty("modified");
    expect(json).not.toHaveProperty("pk");
    expect(json).not.toHaveProperty("pk2");
    expect(json).not.toHaveProperty("pk3");
    expect(json).not.toHaveProperty("sk");
    expect(json).not.toHaveProperty("sk2");
  });

  it("should throw content not found", async () => {
    const event = makeFakeEvent({
      path: "/",
      pathParameters: { modelId: "blog", id: "fake-id" },
      queryStringParameters: { all: "true" },
      headers: { "Content-Type": "application/json" },
      httpMethod: "GET",
    });

    const response = await read(event);
    expect(response.statusCode).toEqual(404);
    expect(response.isBase64Encoded).toBe(false);

    const json = JSON.parse(response.body);
    expect(json.message).toBe("Content not found");
  });

  it("should delete a blog", async () => {
    const blog = contents.blog[9];
    const event = makeFakeEvent({
      path: "/",
      pathParameters: { modelId: "blog", id: blog.id },
      queryStringParameters: { all: "true" },
      headers: { "Content-Type": "application/json" },
      httpMethod: "DELETE",
    });

    const response = await remove(event);
    expect(response.statusCode).toEqual(204);
    expect(response.isBase64Encoded).toBe(false);

    const sk = `CON#${blog.id}`;
    const params = {
      TableName: tableName,
      Key: {
        pk: `MOD#blog`,
        sk,
      },
    };

    const res = await ddb.get(params).promise();
    expect(res).not.toHaveProperty("Item");
  });

  it("should update a blog", async () => {
    const blog = contents.blog[9];
    const { id, ...content } = blog;
    const event = makeFakeEvent({
      path: "/",
      pathParameters: { modelId: "blog", id },
      queryStringParameters: { all: "true" },
      headers: { "Content-Type": "application/json" },
      httpMethod: "PUT",
      body: JSON.stringify({ ...content, name: "Edited blog" }),
    });

    const response = await update(event);
    expect(response.statusCode).toEqual(204);
    expect(response.isBase64Encoded).toBe(false);

    const sk = `CON#${id}`;
    const params = {
      TableName: tableName,
      Key: {
        pk: `MOD#blog`,
        sk,
      },
    };

    const res = await ddb.get(params).promise();
    expect(res.Item.data).toEqual({ ...content, name: "Edited blog" });
  });
});
