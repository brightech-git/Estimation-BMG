import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ba68c8',
    borderRadius: 6,
    backgroundColor: '#f8eafa',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: '#4a148c',
  },
  scanIcon: {
    fontSize: 15,
    paddingLeft: 6,
  },
});