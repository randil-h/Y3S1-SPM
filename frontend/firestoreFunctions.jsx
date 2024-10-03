import { db, storage } from './FirebaseConfig';
import { collection, doc, addDoc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';


// Add a topic to the specific course
export const handleAddTopic = async (courseId, topicData) => {
    try {
        const topicsCollection = collection(db, `courses/${courseId}/topics`);
        await addDoc(topicsCollection, topicData);
        console.log('Topic added successfully to course:', courseId);
    } catch (error) {
        console.error('Error adding topic: ', error);
    }
};


// Fetch topics from the specific course
export const getTopicsFromCourse = async (courseId) => {
    try {
        // Query the topics subcollection of the specific course
        const topicsCollection = collection(db, `courses/${courseId}/topics`);
        const topicsSnapshot = await getDocs(topicsCollection);
        const topicsList = topicsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return topicsList;
    } catch (error) {
        console.error("Error fetching topics: ", error);
        throw error;
    }
};

// Delete a topic from the specific course
export const deleteTopic = async (courseId, topicId) => {
    try {
        // Delete the topic from the specific course's topics subcollection
        const topicDocRef = doc(db, `courses/${courseId}/topics/${topicId}`);
        await deleteDoc(topicDocRef);
        console.log('Topic deleted successfully');
    } catch (error) {
        console.error('Error deleting topic: ', error);
    }
};

// Upload a file for a specific topic under the specific course
export const uploadFileForTopic = async (courseId, topicId, file) => {
    try {
        const storageRef = ref(storage, `courses/${courseId}/topics/${topicId}/${file.name}`);
        const fileBlob = await fetch(file.uri).then((res) => res.blob());

        // Upload the file to Firebase Storage
        await uploadBytes(storageRef, fileBlob);

        console.log('File uploaded successfully');
    } catch (error) {
        console.error('Error uploading file: ', error);
    }
};
