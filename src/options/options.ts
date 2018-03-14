import * as OptionParser from ".";
import * as OptionLib from "../lib/options";
import { optionToObject } from "./optionToObject";

// Program config
export interface IOptions {
  // output debug messages?
  debug: boolean;

  // show the header at the start?
  showHeader: boolean;

  // show warnings?
  showWarnings: boolean;

  // user specified coins
  coins: string[];

  // how long to wait between each coin, ms
  sleepTime: number;

  // unrecognized options
  unrecognized: string[];

  // what type of prices to use?
  prices: OptionParser.PricesOption;

  // what output handler to use?
  outputHandler: OptionParser.OutputHandlerOption;

  // max age of things loaded from https://whattomine.com/coins.json
  maxCacheAge: number;

  // attempt to include fees?
  includeFees: boolean;
}

export function parseOptions(args: string[]) {
  const parsedOptions = OptionLib.parse(args, {
    arguments: {
      /* tslint:disable:object-literal-key-quotes */
      // used by chalk
      "no-color": {
        type: "boolean",
        default: false,
      },
      "debug": {
        type: "boolean",
        default: false,
        aliases: ["verbose"],
      },
      "no-header": {
        type: "boolean",
        default: false,
      },
      "no-warnings": {
        type: "boolean",
        default: false,
      },
      "output": {
        type: "string",
        default: "pretty",
      },
      "prices": {
        type: "string",
        default: "average",
      },
      "sleep-time": {
        type: "number",
        default: 1000,
      },
      "max-age": {
        type: "number",
        default: 60 * 5, // 5 minutes
      },
      "experimental-fees": {
        type: "boolean",
        default: false,
      },
      /* tslint:enable:object-literal-key-quotes */
    },
  });

  const options: IOptions = {
    unrecognized: parsedOptions.unrecognized,
    coins: parsedOptions.plain,
    debug: parsedOptions.arguments.debug as boolean,
    showHeader: !parsedOptions.arguments["no-header"] as boolean,
    showWarnings: !parsedOptions.arguments["no-warnings"] as boolean,
    sleepTime: parsedOptions.arguments["sleep-time"] as number,
    prices: optionToObject(parsedOptions, {
      name: "prices",
      default: OptionParser.PricesOption.Average,
      args: {
        average: OptionParser.PricesOption.Average,
        minimum: OptionParser.PricesOption.MinimumWithWorkers,
        "minimum-with-speed": OptionParser.PricesOption.MinimumWithHashrate,
      },
    }),
    outputHandler: optionToObject<OptionParser.OutputHandlerOption>(parsedOptions, {
      name: "output",
      default: OptionParser.OutputHandlerOption.Pretty,
      args: {
        pretty: OptionParser.OutputHandlerOption.Pretty,
        json: OptionParser.OutputHandlerOption.JSON,
      },
    }),
    maxCacheAge: (parsedOptions.arguments["max-age"] as number) * 1000,
    includeFees: parsedOptions.arguments["experimental-fees"] as boolean,
  };
  return options;
}
