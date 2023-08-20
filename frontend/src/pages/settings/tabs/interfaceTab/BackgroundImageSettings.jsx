import { CheckIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import React, { useEffect } from "react";
import { useState } from "react";
import Modal from "../../../../components/Modal";
import {
  userSettingsKeys,
  useUserSettingsStore,
} from "../../../../stores/userSettingsStore";
import { BUTTON_BASE_CLASS } from "../../../../helpers/baseDesign";
import {
  deleteJSON,
  getJSON,
  postFormData,
  postJSON,
} from "../../../../helpers/fetch";
import { fixBgUrl } from "../../../../helpers/url";
import ImageFileInput from "../../../../components/ImageFileInput";
import { notify } from "../../../../components/Notification";
const ENDPOINT = "/api/backgrounds";

export default function BackgroundImageSettings() {
  const [bgUrl, setBgUrl] = useUserSettingsStore(
    userSettingsKeys.BackgroundImage
  );

  const [images, setImages] = useState([]);
  const [selectedId, setSelectedId] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState();
  const [show, setShow] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [url, setUrl] = useState("");
  const [file, setFile] = useState();

  useEffect(() => {
    let image = images.filter((image) => image.url === bgUrl);
    setSelectedId(image?.[0]?.id);
  }, [bgUrl, images]);

  useEffect(() => {
    let ac = new AbortController();
    async function getImages() {
      let res = await getJSON(ENDPOINT, ac.signal);
      if (res.ok) {
        setImages(await res.json());
      }
    }
    getImages();
    return () => {
      ac.abort();
    };
  }, []);

  useEffect(() => {
    if (error) notify("Error", error || "", "error");
  }, [error]);

  async function handleAdd() {
    setIsLoading(true);
    setError();
    try {
      if (url) {
        let res = await postJSON(ENDPOINT, { url });
        setIsLoading(false);
        if (res.ok) {
          setBgUrl("");
          setFile(undefined);
          let resBody = await res.json();
          setImages((prev) => [...prev, { id: resBody.id, url: resBody.url }]);
          setShow(false);
        } else {
          setError((await res.json())?.message);
        }
      } else {
        let res = await postFormData("/api/backgrounds/add", { file });
        setIsLoading(false);
        if (res.ok) {
          let resBody = await res.json();
          setImages((prev) => [...prev, { id: resBody.id, url: resBody.url }]);
          setShow(false);
          setFile(undefined);
          setUrl(undefined);
        } else {
          setError((await res.json())?.message);
        }
      }
    } catch (err) {
      setIsLoading(true);
      setError(err.message);
    }
  }

  function handleSelect(image) {
    setSelectedId(image.id);
    setBgUrl(image.url);
  }

  async function handleImageDelete() {
    setIsDeleting(true);
    try {
      let res = await deleteJSON(`${ENDPOINT}/${selectedId}`);
      setIsDeleting(false);
      if (res.ok) {
        setShowDelete(false);
        setImages((prev) => prev.filter((image) => image.id !== selectedId));
        setSelectedId();
        setBgUrl("");
      }
    } catch (error) {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1">
        <Modal show={show} onClose={() => setShow(false)}>
          <Modal.Header closeButton>Add image</Modal.Header>
          <Modal.Body>
            <div className="flex flex-col gap-2">
              <input
                type={"url"}
                name="add-bgimage-url"
                placeholder={"Image url"}
                disabled={file}
                value={url}
                onChange={(e) => {
                  setError();
                  setIsLoading(false);
                  setUrl(e.target.value);
                }}
                className="w-full rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 bg-transparent dark:text-white disabled:bg-neutral-100"
              />
              <ImageFileInput
                onChange={(file) => {
                  setError();
                  setIsLoading(false);
                  setFile(file);
                }}
                file={file}
                setFile={setFile}
                disabled={url}
                id="add-bgimage-file"
                name="add-bgimage-file"
              />
              <button
                type="submit"
                disabled={isLoading}
                className={BUTTON_BASE_CLASS}
                onClick={handleAdd}
              >
                Add
              </button>
            </div>
            {error && <div className="text-red-500">{error}</div>}
          </Modal.Body>
        </Modal>
        <Modal show={showDelete} onClose={() => setShowDelete(false)}>
          <Modal.Header>Confirm delete</Modal.Header>
          <Modal.Body>Are you sure you want to delete this image?</Modal.Body>
          <Modal.Footer>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleImageDelete()}
                disabled={isDeleting}
                className={
                  BUTTON_BASE_CLASS +
                  " bg-transparent text-red-500 border border-red-500 hover:bg-red-500 hover:text-white"
                }
              >
                Yes
              </button>
              <button
                disabled={isDeleting}
                onClick={() => setShowDelete(false)}
                className={BUTTON_BASE_CLASS}
              >
                No
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        {images.map((image) => (
          <div
            key={image.id}
            className="flex relative justify-center items-center"
          >
            <label>
              <img
                width={20}
                height={20}
                onClick={() => {
                  handleSelect(image);
                }}
                className={`rounded w-20 h-20 object-cover object-center cursor-pointer ${
                  selectedId === image.id ? "border-2 border-cyan-500" : ""
                }`}
                alt={`bg-img-${image.id}`}
                src={fixBgUrl(image?.thumbs?.small || image.url)}
              />
              <input className="hidden" type="radio" name={userSettingsKeys.BackgroundImage}></input>
            </label>
            {selectedId === image.id && (
              <div className="w-6 h-6 rounded-full bg-cyan-500 absolute cursor-pointer">
                <CheckIcon className="text-white p-1" />
              </div>
            )}
          </div>
        ))}
        <div
          onClick={() => setShow((prev) => !prev)}
          className="rounded w-20 h-20 group border-2 border-cyan-500 cursor-pointer flex justify-center items-center hover:bg-cyan-500"
        >
          <PlusIcon className="w-6 h-6 text-cyan-500 group-hover:text-white" />
        </div>
        {selectedId && (
          <div
            onClick={() => setShowDelete((prev) => !prev)}
            className="rounded w-20 h-20 group border-2 border-red-500 cursor-pointer flex justify-center items-center hover:bg-red-500"
          >
            <TrashIcon className="w-6 h-6 text-red-500 group-hover:text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
