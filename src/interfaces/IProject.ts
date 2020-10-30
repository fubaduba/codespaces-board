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

  /**
   * If to render issues as check list using the [x] markers.
   *
   * default: false
   */
  isCheckListItems?: boolean;

  /**
   * Team developers list, if not set, inferred from
   * the assigned GitHub issues.
   */
  developers?: string[];
}
