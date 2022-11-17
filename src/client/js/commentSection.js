const videoContainer = document.getElementById("videoContainer"); //- find  video _id value
const form = document.getElementById("commentForm");
const delBtn = document.querySelectorAll(".video__delete-comment"); //- delete a Comment

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";

  const span = document.createElement("span");
  span.innerText = ` ${text}`; //- Comment textarea

  const editBtn = document.createElement("button");
  const editIcon = document.createElement("i");
  editIcon.className = "fas fa-pen-to-square";

  const deleteBtn = document.createElement("button");
  const deleteIcon = document.createElement("i");
  deleteIcon.className = "fas fa-eraser";
  deleteBtn.addEventListener("click", handleDeleteComment);

  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(editBtn);
  editBtn.appendChild(editIcon);
  newComment.appendChild(deleteBtn);
  deleteBtn.appendChild(deleteIcon);
  //- videoComments.appendChild(newComment); //- 오름차순
  videoComments.prepend(newComment); //- 내림차순
};

//- create
const handleSubmit = async (event) => {
  event.preventDefault(); //- Stop a reflesh
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id; //- find video _id value

  //- console.log(videoContainer.dataset); //- video _id
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    //- req.body
    body: JSON.stringify({ text }), //- text: text
  });
  //- window.location.reload(); - replash

  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

//- delete
const handleDeleteComment = async (event) => {
  const li = event.target.parentElement; //- Choose Comment
  const commentId = event.target.parentElement.dataset.id;

  if (!commentId) {
    return;
  }

  const response = await fetch(`/api/videos/${commentId}/delete`, {
    method: "DELETE",
  });

  console.log(response.status);
  if (response.status === 201) {
    li.remove();
  }
};

if (delBtn) {
  delBtn.forEach((btnArray) =>
    btnArray.addEventListener("click", handleDeleteComment)
  );
}
