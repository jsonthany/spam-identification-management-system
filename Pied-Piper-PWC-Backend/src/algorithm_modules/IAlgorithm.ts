import { Email } from "../types/Email";

export interface IAlgorithm {

    /**
     * Returns the risk score of given email
     *
     * @param e email needed to be accessed
     * @returns number of the risk score
     */
    getRiskScore(e: Email): number | Promise<number>;
}