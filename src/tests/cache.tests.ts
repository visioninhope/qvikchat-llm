import { runFlow } from "@genkit-ai/flow";
import { defineChatFlow } from "../flows/flow";
import { InMemoryCacheStore } from "../cache/in-memory-cache-store";
import { setupGenkit } from "../genkit";
import { CacheCollection } from "../cache/cache-store";

/**
 * Test suite for Chat Flow Core Functionality.
 *
 * Some tests include the use of LLM model, defining a chat agent, defining API key store, defining chat history store, and defining cache store.
 */
describe("Test - Flow Cache Tests", () => {
  beforeAll(() => {
    setupGenkit();
  });

  // Tests to be performed
  // Set to true to run the test
  const Tests = {
    test_cache_works: true,
  };

  // default test timeout
  const defaultTimeout = 10000; // 10 secondss

  if (Tests.test_cache_works)
    test(
      "Test cache works",
      async () => {
        // use in-memory cache store
        const cacheStore = new InMemoryCacheStore({
          cacheQueryAfterThreshold: 2, // cache response after same query is received twice
        });
        // define chat flow
        const flow = defineChatFlow({
          endpoint: "test-chat-open-cache",
          enableCache: true,
          cacheStore: cacheStore,
        });

        try {
          // send query the first time
          await runFlow(flow, {
            query: "Answer in one sentence: what is Firebase?",
          });

          // send query the second time
          await runFlow(flow, {
            query: "Answer in one sentence: what is Firebase?",
          });

          // send query the third time
          const response = await runFlow(flow, {
            query: "Answer in one sentence: what is Firebase?",
          });

          // check response is valid
          expect(response).toBeDefined();

          // confirm response type
          if (typeof response === "string") {
            // should not be empty
            expect(response.length).toBeGreaterThan(0);
            // check cache was used
            const atLeastOneCacheHit = (cache: CacheCollection) => {
              let flag = false;
              cache.forEach((val) => {
                if (val.cacheHits > 0) {
                  flag = true;
                }
              });
              return flag;
            };
            // confirm cache was used
            expect(atLeastOneCacheHit(cacheStore.cache)).toBeTruthy();
          } else {
            throw new Error(
              `Invalid response object. Response: ${JSON.stringify(response)}`
            );
          }
        } catch (error) {
          throw new Error(`Error in test. Error: ${error}`);
        }
      },
      defaultTimeout
    );
});
