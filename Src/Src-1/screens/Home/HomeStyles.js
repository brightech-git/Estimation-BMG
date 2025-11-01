import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ba68c8',
    borderWidth: 1,
    borderRadius: 6,
    maxHeight: 140,
    marginTop: 2,
    marginBottom: 10,
    zIndex: 10,
    elevation: 5,
  },
  dropdownItem: {
    padding: 10,
    borderBottomColor: '#e1bee7',
    borderBottomWidth: 1,
    color: '#4a148c',
  },
  trannoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4a148c',
    marginTop: 12,
    textAlign: 'center',
  },
});