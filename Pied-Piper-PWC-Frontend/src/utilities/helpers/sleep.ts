export const sleep = async (sleepTime: number): Promise<void> => new Promise((resolve) => {
  setTimeout(resolve, sleepTime);
});
