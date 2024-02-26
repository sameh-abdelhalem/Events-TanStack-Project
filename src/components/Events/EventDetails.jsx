import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      navigate("/events");
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
    },
  });
  const handleStartDelete = () => {
    setIsDeleting(true);
    mutate({ id: params.id });
  };
  const handleStopDelete = () => {
    setIsDeleting(false);
  };
  const deleteEventHandler = () => {
    setIsDeleting(true);
  };

  let content;
  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>
            Do you really want to delete this event? this action cannot be
            undone.
          </p>
          <div className="form-actions">
            <button onClick={handleStopDelete} className="button-text">
              Cancel
            </button>
            <button onClick={handleStartDelete} className="button">
              Delete
            </button>
          </div>
          {isPendingDeletion && <p>event is being deleted...</p>}
          {isErrorDeleting && (
            <ErrorBlock
              title={"an error has occured"}
              message={deleteError.info?.message || "could not delete event"}
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isPending && <LoadingIndicator />}
      {data && (
        <article id="event-details">
          <header>
            <h1>{data.title}</h1>
            <nav>
              <button onClick={deleteEventHandler}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={`http://localhost:3000/${data.image}`} alt="" />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>{data.time}</time>
              </div>
              <p id="event-details-description">{data.description}</p>
            </div>
          </div>
        </article>
      )}

      {isError && (
        <ErrorBlock
          title="could not fetch event details"
          message={
            error.info?.message ||
            "could not fetch event details, please try again later."
          }
        />
      )}
    </>
  );
}
