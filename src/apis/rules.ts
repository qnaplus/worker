import { refereeFyiRulesSchema } from "../schemas";

export const isValidSeason = (season: string) => {
    const match = season.match(/^(\d{4})-(\d{4})$/);
    if (!match) {
        return false;
    }
    return Number.parseInt(match[2]) - Number.parseInt(match[1]) === 1;
}

export const fetchRules = async (season: string) => {
    if (!isValidSeason(season)) {
        throw new Error("The provided season is in an invalid format.");
    }
    const response = await fetch(`https://referee.fyi/rules/V5RC/${season}.json`);
    if (!response.ok) {
        throw new Error(`Unable to fetch rules (${response.status} code: ${response.statusText ?? "No status text."})`);
    }
    const json = await response.json();
    return refereeFyiRulesSchema.parse(json);
}
