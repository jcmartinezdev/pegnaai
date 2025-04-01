const mockAuth0 = {
  getSession: jest.fn().mockResolvedValue({
    user: { sub: "test-user-id", name: "Test User" },
  }),
};

export const auth0 = mockAuth0;
