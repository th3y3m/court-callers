import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./style.scss";
import "./editStyle.scss";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { IoCloudUploadOutline } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { storageDb } from "firebase.js";
import { v4 } from "uuid";
import {
  validateFullName,
  validateUserName,
  validateAddress,
  validatePhone,
  validateYob,
} from "../Validations/formValidation";
const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPic, setUserPic] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [editFormValues, setEditFormValues] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    yearOfBirth: "",
    profilePicture: [],
  });
  const inputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);

  const [fullNameValidation, setFullNameValidation] = useState({
    isValid: true,
    message: "",
  });

  const [userNameValidation, setUserNameValidation] = useState({
    isValid: true,
    message: "",
  });

  const [phoneValidation, setPhoneValidation] = useState({
    isValid: true,
    message: "",
  });

  const [addressValidation, setAddressValidation] = useState({
    isValid: true,
    message: "",
  });

  const [yobValidation, setYobValidation] = useState({
    isValid: true,
    message: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded = jwtDecode(token);
      setUserName(decoded.name);
      setUserPic(decoded.picture);
      setUserEmail(decoded.email);

      const fetchUserData = async (id, isGoogle) => {
        try {
          if (isGoogle) {
            const response = await axios.get(
              `https://courtcaller.azurewebsites.net/api/UserDetails/GetUserDetailByUserEmail/${id}`
            );
            setUserData(response.data);
            const userResponse = await axios.get(
              `https://courtcaller.azurewebsites.net/api/Users/GetUserDetailByUserEmail/${id}?searchValue=${id}`
            );
            setUser(userResponse.data);
          } else {
            const response = await axios.get(
              `https://courtcaller.azurewebsites.net/api/UserDetails/${id}`
            );
            setUserData(response.data);
            const userResponse = await axios.get(
              `https://courtcaller.azurewebsites.net/api/Users/${id}`
            );
            setUser(userResponse.data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      if (decoded.iss !== "https://accounts.google.com") {
        const userId = decoded.Id;
        setUserId(userId);
        fetchUserData(userId, false);
      } else {
        const userId = decoded.email;
        setUserId(userId);
        fetchUserData(userId, true);
      }
    }
  }, []);
  console.log("user", user);

  useEffect(() => {
    if (user && userData) {
      setEditFormValues({
        fullName: userData.fullName,
        userName: user.userName,
        phoneNumber: user.phoneNumber || "",
        address: userData.address || "",
        yearOfBirth: userData.yearOfBirth || "",
        profilePicture: userData.profilePicture || null,
      });
    }
  }, [user, userData]);

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
  };

  const handleUpdate = async () => {
    // Determine which fields have changed
    const changes = {};
    if (editFormValues.fullName !== userData.fullName) {
      changes.fullName = editFormValues.fullName;
    }
    if (editFormValues.userName !== user.userName) {
      changes.userName = editFormValues.userName;
    }
    if (editFormValues.phoneNumber !== user.phoneNumber) {
      changes.phoneNumber = editFormValues.phoneNumber;
    }
    if (editFormValues.address !== userData.address) {
      changes.address = editFormValues.address;
    }
    if (editFormValues.yearOfBirth !== userData.yearOfBirth) {
      changes.yearOfBirth = editFormValues.yearOfBirth;
    }
    if (selectedFile) {
      changes.profilePicture = selectedFile;
    }

    // Validate only the changed fields
    const validations = {};
    if (changes.fullName) {
      validations.fullName = validateFullName(changes.fullName);
    }
    if (changes.userName) {
      validations.userName = await validateUserName(changes.userName);
    }
    if (changes.phoneNumber) {
      validations.phoneNumber = validatePhone(changes.phoneNumber);
    }
    if (changes.address) {
      validations.address = validateAddress(changes.address);
    }
    if (changes.yearOfBirth) {
      validations.yearOfBirth = validateYob(changes.yearOfBirth);
    }

    // Set validation states
    setFullNameValidation(
      validations.fullName || { isValid: true, message: "" }
    );
    setUserNameValidation(
      validations.userName || { isValid: true, message: "" }
    );
    setPhoneValidation(
      validations.phoneNumber || { isValid: true, message: "" }
    );
    setAddressValidation(validations.address || { isValid: true, message: "" });
    setYobValidation(validations.yearOfBirth || { isValid: true, message: "" });

    // Check if all validations passed
    const allValid = Object.values(validations).every(
      (validation) => validation.isValid
    );
    if (!allValid) {
      setMessage("Please try again");
      setMessageType("error");
      return;
    }

    try {
      const uploadImageTask = async (selectedFile) => {
        const imageRef = ref(storageDb, `BranchImage/${v4()}`);
        await uploadBytes(imageRef, selectedFile);
        const url = await getDownloadURL(imageRef);
        return url;
      };

      let imageUrl = null;
      if (selectedFile) {
        imageUrl = await uploadImageTask(selectedFile);
      }

      let formData = new FormData();
      formData.append("fullName", editFormValues.fullName);
      formData.append("userName", editFormValues.userName);
      formData.append("phoneNumber", editFormValues.phoneNumber);
      formData.append("address", editFormValues.address);
      formData.append("yearOfBirth", editFormValues.yearOfBirth);
      if (imageUrl) {
        formData.append("profilePicture", imageUrl);
      }

      const response = await axios.put(
        `https://courtcaller.azurewebsites.net/api/UserDetails/foruser/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setUserData(response.data);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleOnChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  const onRemoveFile = () => {
    setSelectedFile(null);
  };

  if (!userData || !user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="user-info">
        <div className="info-container">
          <div className="info-box">
            <h2>Basic Information</h2>
            <div className="form-group">
              <p className="info-field">Full Name</p>
              <p className="info">{userData.fullName}</p>
            </div>
            <div className="form-group">
              <p className="info-field">User Name</p>
              <p className="info">{user.userName}</p>
            </div>
            <div className="form-group">
              <p className="info-field">Date of Birth</p>
              <p className="info">{userData.yearOfBirth}</p>
            </div>
            <div className="form-group">
              <p className="info-field">Address</p>
              <p className="info">{userData.address}</p>
            </div>
          </div>
          <div className="contact-box">
            <h2>Contact Information</h2>
            <div className="form-group">
              <p className="info-field">Email</p>
              <p className="info">{user.email}</p>
            </div>
            <div className="form-group">
              <p className="info-field">Phone</p>
              <p className="info">{user.phoneNumber}</p>
            </div>
          </div>
        </div>

        <div className="user-image-container">
          <div className="user-image">
            <div className="image-placeholder">
              <img
                className="profile-img"
                src={userData.profilePicture}
                alt="user image"
              />
            </div>
            <p>Profile Picture</p>
            <p style={{ margin: 0, color: "#00c853" }}>Online</p>
          </div>
        </div>
      </div>

      <div className="btn-container">
        <div className="buttons">
          <Link to="/">
            <button className="btn-back">Back</button>
          </Link>
          <button className="btn-edit" onClick={handleEditClick}>
            Edit
          </button>
        </div>
      </div>

      {showEditModal && (
        <div className="edit-form-container">
          <div className="edit-container">
            <h2 className="edit-header">Update Information</h2>
            <div className="form-box">
              <div className="form-edit-group">
                <div className="account">
                  <h3>Account</h3>
                  <p>Balance: {userData.balance}</p>
                </div>
                <div className="form-edit">
                  <div className="edit-left">
                    <div className="form-field">
                      <span>Full Name</span>
                      <input
                        className={
                          fullNameValidation.isValid
                            ? "input-fname"
                            : "error-input-profile"
                        }
                        type="text"
                        id="fname"
                        name="fullName"
                        value={editFormValues.fullName}
                        onChange={handleChange}
                      />
                      {fullNameValidation.message && (
                        <p className="errorVal">{fullNameValidation.message}</p>
                      )}
                    </div>
                    <div className="form-field">
                      <span>User Name</span>
                      <input
                        className={
                          userNameValidation.isValid
                            ? "input-uname"
                            : "error-input-profile"
                        }
                        type="text"
                        id="uname"
                        name="userName"
                        value={editFormValues.userName}
                        onChange={handleChange}
                      />
                      {userNameValidation.message && (
                        <p className="errorVal">{userNameValidation.message}</p>
                      )}
                    </div>
                    <div className="form-field">
                      <span>Phone</span>
                      <input
                        className={
                          phoneValidation.isValid
                            ? "input-phone"
                            : "error-input-profile"
                        }
                        type="text"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={editFormValues.phoneNumber}
                        onChange={handleChange}
                      />
                      {phoneValidation.message && (
                        <p className="errorVal">{phoneValidation.message}</p>
                      )}
                    </div>
                    <div style={{ marginTop: 20 }}>
                      <p style={{ marginBottom: 10 }}>Profile Image</p>
                      <input
                        type="file"
                        ref={inputRef}
                        onChange={handleOnChange}
                        style={{ margin: 0, display: "none" }}
                      />
                      <button className="file-btn" onClick={onChooseFile}>
                        <span className="material-symbol-rounded">
                          <IoCloudUploadOutline />
                        </span>{" "}
                        Upload File
                      </button>
                      {selectedFile && (
                        <div className="selected-file">
                          <p>{selectedFile.name}</p>
                          <button className="file-btn" onClick={onRemoveFile}>
                            <span
                              style={{ width: 38 }}
                              className="material-symbol-rounded"
                            >
                              <RiDeleteBin6Line style={{ width: 25 }} />
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="edit-right">
                    <div className="form-field">
                      <span>Address</span>
                      <input
                        className={
                          addressValidation.isValid
                            ? "input-address"
                            : "error-input-profile"
                        }
                        type="text"
                        id="address"
                        name="address"
                        value={editFormValues.address}
                        onChange={handleChange}
                      />
                      {addressValidation.message && (
                        <p className="errorVal">{addressValidation.message}</p>
                      )}
                    </div>
                    <div className="form-field">
                      <span>Year of birth</span>
                      <input
                        className={
                          yobValidation.isValid
                            ? "input-date"
                            : "error-input-profile"
                        }
                        type="text"
                        id="yearOfBirth"
                        name="yearOfBirth"
                        value={editFormValues.yearOfBirth}
                        onChange={handleChange}
                      />
                      {yobValidation.message && (
                        <p className="errorVal">{yobValidation.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="buttons-edit">
              <button className="btn-back" onClick={handleCancelEdit}>
                Cancel
              </button>
              <button className="btn-update" onClick={handleUpdate}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
