import * as wn from "webnative";
import {
  showIds,
  showError,
  hideIds,
  renderMeasurements,
  setContent,
  setClickHandler,
} from "./ui";
import { initFilesystem } from "./filesystem";

const init = (env = "prod") => {
  showIds("loading");

  wn.setup.endpoints(environments[env]);

  performance.mark("BEGIN_INITIALISE");
  wn.initialise({
    permissions: {
      app: {
        name: "Benchmark",
        creator: "Fission",
      },
    },
  })
    .then(async (state) => {
      performance.mark("END_INITIALISE");
      performance.measure("INITIALISE", "BEGIN_INITIALISE");

      switch (state.scenario) {
        case wn.Scenario.NotAuthorised:
          console.warn("not authorised");
          showIds("welcome");
          hideIds("user");
          break;
        case wn.Scenario.AuthCancelled:
          console.warn("auth cancelled");
          showIds("welcome");
          hideIds("user");
          break;
        case wn.Scenario.AuthSucceeded:
        case wn.Scenario.Continuation:
          showIds("user");
          hideIds("welcome");
          setContent("username", state.username);
          initFilesystem(state.fs);
          break;
      }

      const auth = () => {
        return wn.redirectToLobby(state.permissions);
      };

      const leave = () => {
        wn.leave();
      };

      setClickHandler("auth", auth);
      setClickHandler("leave", leave);
      hideIds("loading");

      renderMeasurements();
    })
    .catch((err) => {
      hideIds("loading");
      showError(err);
    });
};

export default init;

const environments = {
  prod: {
    api: "https://runfission.com",
    lobby: "https://auth.fission.codes",
    user: "fission.name",
  },
  staging: {
    api: "https://runfission.net",
    lobby: "https://auth.runfission.net",
    user: "fissionuser.net",
  },
};
