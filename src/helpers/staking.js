
const getPairNameByPid = (pid) => {
  switch (pid) {
    case 0:
      return 'coreDaoLp1';
    case 1:
      return 'coreDaoLp2';
    case 2:
      return 'coreDaoLp3';
    case 3:
      return 'coreDAO';
  }
};

export default {
  getPairNameByPid
};
