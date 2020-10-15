
export const ident = (steps: number) => {
    const step = `  `;
    const items = new Array(steps).fill(step);

    return items.join();
};
