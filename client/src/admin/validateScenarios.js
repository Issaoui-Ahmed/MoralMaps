export function validateScenarioConfig(config) {
  const errors = [];
  const scenarios = Array.isArray(config?.scenarios) ? config.scenarios : [];
  const settings = config?.settings || {};

  if (!Array.isArray(scenarios) || scenarios.length === 0) {
    errors.push("At least one scenario must be defined");
  }

  const numScenarios = settings.number_of_scenarios;
  if (!Number.isInteger(numScenarios) || numScenarios < 1 || numScenarios > scenarios.length) {
    errors.push("number_of_scenarios must be between 1 and the number of scenarios");
  }

  if (typeof settings.scenario_shuffle !== "boolean") {
    errors.push("scenario_shuffle must be a boolean");
  }

  const validCoord = (tuple) =>
    Array.isArray(tuple) &&
    tuple.length === 2 &&
    typeof tuple[0] === "number" &&
    typeof tuple[1] === "number" &&
    tuple[0] >= -90 &&
    tuple[0] <= 90 &&
    tuple[1] >= -180 &&
    tuple[1] <= 180;

  const validCoordArray = (arr) => Array.isArray(arr) && arr.length > 0 && arr.every(validCoord);

  const validString = (s) => typeof s === "string" && s.trim() !== "";

  scenarios.forEach((sc, i) => {
    const prefix = `Scenario ${i + 1}: `;
    const choiceList = Array.isArray(sc?.choice_list) ? sc.choice_list : [];

    if (!sc.randomly_preselect_route) {
      const pre = choiceList.filter((c) => c.preselected).length;
      if (pre === 0) {
        errors.push(prefix + "must have a preselected route or randomly_preselect_route=true");
      }
      if (pre > 1) {
        errors.push(prefix + "cannot have multiple preselected routes when randomly_preselect_route=false");
      }
    }

    if (!validCoordArray(sc?.start)) {
      errors.push(prefix + "start must contain valid coordinates");
    }
    if (!validCoordArray(sc?.end)) {
      errors.push(prefix + "end must contain valid coordinates");
    }

    const drt = Array.isArray(sc?.default_route_time) ? sc.default_route_time : [];
    if (drt.length === 0 || drt.some((n) => !Number.isInteger(n) || n <= 0)) {
      errors.push(prefix + "default_route_time must contain positive integers");
    }

    if (!validString(sc?.name)) {
      errors.push(prefix + "name must be a non-empty string");
    }
    if (!validString(sc?.description)) {
      errors.push(prefix + "description must be a non-empty string");
    }

    if (choiceList.length === 0) {
      errors.push(prefix + "choice_list must not be empty");
    }

    choiceList.forEach((ch, j) => {
      const cPrefix = `${prefix}Choice ${j + 1}: `;
      if (!validCoordArray(ch?.middle_point)) {
        errors.push(cPrefix + "middle_point must contain valid coordinates");
      }
      const tts = Array.isArray(ch?.tts) ? ch.tts : [];
      if (tts.length === 0 || tts.some((n) => !Number.isInteger(n) || n < 0)) {
        errors.push(cPrefix + "tts must contain non-negative integers");
      }
      if (typeof ch?.preselected !== "boolean") {
        errors.push(cPrefix + "preselected must be boolean");
      }
    });
  });

  return { ok: errors.length === 0, errors };
}
