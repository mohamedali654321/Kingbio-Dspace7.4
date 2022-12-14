/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
package org.dspace.xmlworkflow.state.actions.processingaction;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.http.HttpServletRequest;

import org.dspace.app.util.Util;
import org.dspace.authorize.AuthorizeException;
import org.dspace.content.DCDate;
import org.dspace.content.MetadataSchemaEnum;
import org.dspace.core.Context;
import org.dspace.xmlworkflow.factory.XmlWorkflowServiceFactory;
import org.dspace.xmlworkflow.state.Step;
import org.dspace.xmlworkflow.state.actions.ActionResult;
import org.dspace.xmlworkflow.storedcomponents.XmlWorkflowItem;

/**
 * Processing class of an action where a single user has
 * been assigned and they can either accept/reject the workflow item
 * or reject the task
 *
 * @author Bram De Schouwer (bram.deschouwer at dot com)
 * @author Kevin Van de Velde (kevin at atmire dot com)
 * @author Ben Bosman (ben at atmire dot com)
 * @author Mark Diggory (markd at atmire dot com)
 */
public class SingleUserReviewAction extends ProcessingAction {

    public static final int MAIN_PAGE = 0;
    public static final int REJECT_PAGE = 1;
    public static final int SUBMITTER_IS_DELETED_PAGE = 2;

    public static final int OUTCOME_REJECT = 1;

    protected static final String SUBMIT_APPROVE = "submit_approve";
    protected static final String SUBMIT_REJECT = "submit_reject";
    protected static final String SUBMIT_DECLINE_TASK = "submit_decline_task";

    @Override
    public void activate(Context c, XmlWorkflowItem wfItem) {

    }

    @Override
    public ActionResult execute(Context c, XmlWorkflowItem wfi, Step step, HttpServletRequest request)
        throws SQLException, AuthorizeException, IOException {
        int page = Util.getIntParameter(request, "page");

        switch (page) {
            case MAIN_PAGE:
                return processMainPage(c, wfi, step, request);
            case REJECT_PAGE:
                return processRejectPage(c, wfi, step, request);
            case SUBMITTER_IS_DELETED_PAGE:
                return processSubmitterIsDeletedPage(c, wfi, request);
            default:
                return new ActionResult(ActionResult.TYPE.TYPE_CANCEL);
        }
    }

    @Override
    public List<String> getOptions() {
        List<String> options = new ArrayList<>();
        options.add(SUBMIT_APPROVE);
        options.add(SUBMIT_REJECT);
        options.add(SUBMIT_DECLINE_TASK);
        return options;
    }

    public ActionResult processMainPage(Context c, XmlWorkflowItem wfi, Step step, HttpServletRequest request)
        throws SQLException, AuthorizeException {
        if (request.getParameter(SUBMIT_APPROVE) != null) {
            //Delete the tasks
            addApprovedProvenance(c, wfi);

            return new ActionResult(ActionResult.TYPE.TYPE_OUTCOME, ActionResult.OUTCOME_COMPLETE);
        } else if (request.getParameter(SUBMIT_REJECT) != null) {
            // Make sure we indicate which page we want to process
            if (wfi.getSubmitter() == null) {
                request.setAttribute("page", SUBMITTER_IS_DELETED_PAGE);
            } else {
                request.setAttribute("page", REJECT_PAGE);
            }
            // We have pressed reject item, so take the user to a page where they can reject
            return new ActionResult(ActionResult.TYPE.TYPE_PAGE);
        } else if (request.getParameter(SUBMIT_DECLINE_TASK) != null) {
            return new ActionResult(ActionResult.TYPE.TYPE_OUTCOME, OUTCOME_REJECT);

        } else {
            //We pressed the leave button so return to our submissions page
            return new ActionResult(ActionResult.TYPE.TYPE_SUBMISSION_PAGE);
        }
    }

    private void addApprovedProvenance(Context c, XmlWorkflowItem wfi) throws SQLException, AuthorizeException {
        //Add the provenance for the accept
        String now = DCDate.getCurrent().toString();

        // Get user's name + email address
        String usersName = XmlWorkflowServiceFactory.getInstance().getXmlWorkflowService()
                                                    .getEPersonName(c.getCurrentUser());

        String provDescription = getProvenanceStartId() + " Approved for entry into archive by "
            + usersName + " on " + now + " (GMT) ";

        // Add to item as a DC field
        itemService.addMetadata(c, wfi.getItem(), MetadataSchemaEnum.DC.getName(), "description", "provenance", "en",
                                provDescription);
        itemService.update(c, wfi.getItem());
    }

    public ActionResult processRejectPage(Context c, XmlWorkflowItem wfi, Step step, HttpServletRequest request)
        throws SQLException, AuthorizeException, IOException {
        if (request.getParameter("submit_reject") != null) {
            String reason = request.getParameter("reason");
            if (reason == null || 0 == reason.trim().length()) {
                request.setAttribute("page", REJECT_PAGE);
                addErrorField(request, "reason");
                return new ActionResult(ActionResult.TYPE.TYPE_ERROR);
            }

            //We have pressed reject, so remove the task the user has & put it back to a workspace item
            XmlWorkflowServiceFactory.getInstance().getXmlWorkflowService()
                                     .sendWorkflowItemBackSubmission(c, wfi, c.getCurrentUser(),
                                                                     this.getProvenanceStartId(), reason);


            return new ActionResult(ActionResult.TYPE.TYPE_SUBMISSION_PAGE);
        } else {
            //Cancel, go back to the main task page
            request.setAttribute("page", MAIN_PAGE);

            return new ActionResult(ActionResult.TYPE.TYPE_PAGE);
        }
    }

    public ActionResult processSubmitterIsDeletedPage(Context c, XmlWorkflowItem wfi, HttpServletRequest request)
        throws SQLException, AuthorizeException, IOException {
        if (request.getParameter("submit_delete") != null) {
            XmlWorkflowServiceFactory.getInstance().getXmlWorkflowService()
                    .deleteWorkflowByWorkflowItem(c, wfi, c.getCurrentUser());
            // Delete and send user back to myDspace page
            return new ActionResult(ActionResult.TYPE.TYPE_SUBMISSION_PAGE);
        } else if (request.getParameter("submit_keep_it") != null) {
            // Do nothing, just send it back to myDspace page
            return new ActionResult(ActionResult.TYPE.TYPE_SUBMISSION_PAGE);
        } else {
            //Cancel, go back to the main task page
            request.setAttribute("page", MAIN_PAGE);
            return new ActionResult(ActionResult.TYPE.TYPE_PAGE);
        }
    }
}
