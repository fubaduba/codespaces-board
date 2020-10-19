export interface IProject {
  /**
   * Project id.
   *
   * @TJS-type integer
   */
  id: number;
  /**
   * Issue labels that will be rendered as sections
   * on the aggregated issue.
   */
  trackLabels?: string[];
}
