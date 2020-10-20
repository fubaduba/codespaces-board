
export const pluck = (propName: string) => {
  return (obj: any) => {
    return obj[propName];
  };
};
