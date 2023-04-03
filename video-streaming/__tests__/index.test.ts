import request from 'supertest';
import main, { app } from '../src/server/server';

main();

describe("video streaming microservice", () => {

    test("microservice can handle requests", async () => {

        const response = await request(app).get("/live"); // Makes a request to the "/live" route.
        expect(response.status).toBe(200); // Verify that a HTTP status code 200 is returned, indicating success.
    });
});