/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
package org.dspace.xmlworkflow.state.actions.processingaction;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.servlet.http.HttpServletRequest;

import org.dspace.app.util.Util;
import org.dspace.authorize.AuthorizeException;
import org.dspace.core.Context;
import org.dspace.eperson.EPerson;
import org.dspace.eperson.service.EPersonService;
import org.dspace.xmlworkflow.Role;
import org.dspace.xmlworkflow.state.Step;
import org.dspace.xmlworkflow.state.actions.ActionResult;
import org.dspace.xmlworkflow.storedcomponents.WorkflowItemRole;
import org.dspace.xmlworkflow.storedcomponents.XmlWorkflowItem;
import org.dspace.xmlworkflow.storedcomponents.service.WorkflowItemRoleService;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Processing class for an action where an assigned user can
 * assign another user to review the item
 *
 * @author Bram De Schouwer (bram.deschouwer at dot com)
 * @author Kevin Van de Velde (kevin at atmire dot com)
 * @author Ben Bosman (ben at atmire dot com)
 * @author Mark Diggory (markd at atmire dot com)
 */
public class SelectReviewerAction extends ProcessingAction {

    public static final int SEARCH_RESULTS_PAGE = 1;

    public static final int RESULTS_PER_PAGE = 5;

    private static final String SUBMIT_CANCEL = "submit_cancel";
    private static final String SUBMIT_SEARCH = "submit_search";
    private static final String SUBMIT_SELECT_REVIEWER = "submit_select_reviewer_";

    private Role role;

    @Autowired(required = true)
    private EPersonService ePersonService;

    @Autowired(required = true)
    private WorkflowItemRoleService workflowItemRoleService;

    @Override
    public void activate(Context c, XmlWorkflowItem wf) {

    }

    @Override
    public ActionResult execute(Context c, XmlWorkflowItem wfi, Step step, HttpServletRequest request)
            throws SQLException, AuthorizeException {
        String submitButton = Util.getSubmitButton(request, SUBMIT_CANCEL);

        //Check if our user has pressed cancel
        if (submitButton.equals(SUBMIT_CANCEL)) {
            //Send us back to the submissions page
            return new ActionResult(ActionResult.TYPE.TYPE_CANCEL);

        } else if (submitButton.equals(SUBMIT_SEARCH)) {
            //Perform the search
            String query = request.getParameter("query");
            int page = Util.getIntParameter(request, "result-page");
            if (page == -1) {
                page = 0;
            }

            int resultCount = ePersonService.searchResultCount(c, query);
            List<EPerson> epeople = ePersonService.search(c, query, page * RESULTS_PER_PAGE, RESULTS_PER_PAGE);


            request.setAttribute("eperson-result-count", resultCount);
            request.setAttribute("eperson-results", epeople);
            request.setAttribute("result-page", page);
            request.setAttribute("page", SEARCH_RESULTS_PAGE);
            return new ActionResult(ActionResult.TYPE.TYPE_PAGE, SEARCH_RESULTS_PAGE);
        } else if (submitButton.startsWith(SUBMIT_SELECT_REVIEWER)) {
            //Retrieve the identifier of the eperson which will do the reviewing
            UUID reviewerId = UUID.fromString(submitButton.substring(submitButton.lastIndexOf("_") + 1));
            EPerson reviewer = ePersonService.find(c, reviewerId);
            //Assign the reviewer. The workflowitemrole will be translated into a task in the autoassign
            WorkflowItemRole workflowItemRole = workflowItemRoleService.create(c);
            workflowItemRole.setEPerson(reviewer);
            workflowItemRole.setRoleId(getRole().getId());
            workflowItemRole.setWorkflowItem(wfi);
            workflowItemRoleService.update(c, workflowItemRole);
            return new ActionResult(ActionResult.TYPE.TYPE_OUTCOME, ActionResult.OUTCOME_COMPLETE);
        }

        //There are only 2 active buttons on this page, so if anything else happens just return an error
        return new ActionResult(ActionResult.TYPE.TYPE_ERROR);
    }

    @Override
    public List<String> getOptions() {
        List<String> options = new ArrayList<>();
        options.add(SUBMIT_SEARCH);
        options.add(SUBMIT_SELECT_REVIEWER);
        return options;
    }

    public Role getRole() {
        return role;
    }

    @Autowired(required = true)
    public void setRole(Role role) {
        this.role = role;
    }
}
