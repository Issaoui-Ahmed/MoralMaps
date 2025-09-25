export function pickOne(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function buildScenarios(cfg = {}) {
  const allEntries =
    typeof cfg.scenarios === "object" && cfg.scenarios !== null
      ? Object.entries(cfg.scenarios)
      : [];
  const settings = cfg.settings || {};
  const desired =
    typeof settings.number_of_scenarios === "number"
      ? settings.number_of_scenarios
      : allEntries.length;
  const count = Math.min(desired, allEntries.length);

  let chosen = allEntries.slice();
  if (count < allEntries.length) {
    const selected = [];
    let toSelect = count;
    for (let i = 0; i < allEntries.length && toSelect > 0; i++) {
      const remaining = allEntries.length - i;
      const probability = toSelect / remaining;
      if (Math.random() < probability) {
        selected.push(allEntries[i]);
        toSelect -= 1;
      }
    }
    chosen = selected;
  }
  if (settings.scenario_shuffle) {
    chosen = chosen.sort(() => Math.random() - 0.5);
  }

  return chosen.map(([, sc]) => {
    const scenario = {
      start: pickOne(sc.start),
      end: pickOne(sc.end),
      default_route_time: pickOne(sc.default_route_time),
      scenario_name: Array.isArray(sc.scenario_name)
        ? pickOne(sc.scenario_name)
        : sc.scenario_name,
      value_name: Array.isArray(sc.value_name)
        ? pickOne(sc.value_name)
        : sc.value_name,
      description: Array.isArray(sc.description)
        ? pickOne(sc.description)
        : sc.description,
      choice_list: (sc.choice_list || []).map((route) => ({
        middle_point: pickOne(route.middle_point),
        tts: pickOne(route.tts),
        preselected: route.preselected,
      })),
      randomly_preselect_route: sc.randomly_preselect_route,
    };

    if (scenario.randomly_preselect_route) {
      const idx = Math.floor(Math.random() * scenario.choice_list.length);
      scenario.choice_list = scenario.choice_list.map((r, i) => ({
        ...r,
        preselected: i === idx,
      }));
    } else {
      let found = false;
      scenario.choice_list = scenario.choice_list.map((r) => {
        if (r.preselected && !found) {
          found = true;
          return r;
        }
        return { ...r, preselected: false };
      });
      if (!found && scenario.choice_list.length > 0) {
        scenario.choice_list[0].preselected = true;
      }
    }

    delete scenario.randomly_preselect_route;
    return scenario;
  });
}
